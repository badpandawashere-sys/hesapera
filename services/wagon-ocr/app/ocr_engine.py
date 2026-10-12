"""OCR engine abstraction and RapidOCR (PaddleOCR-ONNX family) implementation."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
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
    RapidOCR implementation using ONNX Runtime.
    Runs PaddleOCR PP-OCRv4 detection (DBNet), angle classification, and recognition models on CPU.
    """

    def __init__(self) -> None:
        from rapidocr_onnxruntime import RapidOCR

        # Initialize RapidOCR engine (loads ONNX models once in memory)
        self._engine = RapidOCR()

    def recognize(self, image: np.ndarray) -> list[OcrBlock]:
        # RapidOCR returns: (result, elapse_list)
        # where result is: [[dt_boxes, rec_res, score], ...]
        raw_result, _ = self._engine(image)

        if not raw_result:
            return []

        blocks: list[OcrBlock] = []

        for item in raw_result:
            if not item or len(item) < 3:
                continue

            dt_box, text, score = item[0], item[1], item[2]
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


def get_ocr_engine() -> BaseOcrEngine:
    """Returns the singleton OCR engine instance."""
    global _global_engine
    if _global_engine is None:
        _global_engine = RapidOcrEngine()
    return _global_engine
