"""OCR engine abstraction and RapidOCR (PP-OCRv6 ONNX family) implementation."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from threading import Lock
import numpy as np


@dataclass
class OcrBlock:
    """A single recognized text block with geometric bounding box and confidence."""

    text: str
    confidence: float
    bbox: tuple[int, int, int, int]  # (x1, y1, x2, y2)
    polygon: list[list[int]] | None = None


class BaseOcrEngine(ABC):
    """Abstract interface for local OCR engines."""

    @abstractmethod
    def recognize(self, image: np.ndarray) -> list[OcrBlock]:
        """Runs text detection and recognition on an OpenCV image array."""
        pass


class RapidOcrEngine(BaseOcrEngine):
    """
    RapidOCR implementation using ONNX Runtime CPU.
    Runs PaddleOCR PP-OCRv6 detection, angle classification, and recognition models on CPU.
    """

    def __init__(self) -> None:
        from rapidocr import RapidOCR

        # Initialize RapidOCR engine (loads ONNX models once in memory)
        self._engine = RapidOCR()

    def recognize(self, image: np.ndarray) -> list[OcrBlock]:
        # RapidOCR returns a RapidOCROutput object with boxes, txts, scores, elapse
        output = self._engine(image)

        if output is None or output.boxes is None or output.txts is None:
            return []

        blocks: list[OcrBlock] = []
        scores = output.scores if output.scores is not None else [1.0] * len(output.txts)

        for dt_box, text, score in zip(output.boxes, output.txts, scores):
            clean_text = str(text or "").strip()

            if not clean_text:
                continue

            # Convert polygon points to int coordinates
            try:
                poly = [[int(round(pt[0])), int(round(pt[1]))] for pt in dt_box]
                xs = [pt[0] for pt in poly]
                ys = [pt[1] for pt in poly]
                x1, y1, x2, y2 = min(xs), min(ys), max(xs), max(ys)
            except Exception:
                continue

            conf = float(score) if score is not None else 0.0
            conf = max(0.0, min(1.0, round(conf, 4)))

            blocks.append(
                OcrBlock(
                    text=clean_text,
                    confidence=conf,
                    bbox=(x1, y1, x2, y2),
                    polygon=poly,
                )
            )

        return blocks


# Cached singleton instance to avoid reloading models on every request
_global_engine: BaseOcrEngine | None = None
_engine_lock = Lock()


def is_engine_ready() -> bool:
    """Returns True if the singleton OCR engine has been initialized and is ready."""
    global _global_engine
    return _global_engine is not None


def get_ocr_engine() -> BaseOcrEngine:
    """Returns the singleton OCR engine instance, initializing it if necessary."""
    global _global_engine
    with _engine_lock:
        if _global_engine is None:
            _global_engine = RapidOcrEngine()
    return _global_engine
