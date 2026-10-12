"""Deterministic row clustering and ordering for OCR text blocks."""

from .ocr_engine import OcrBlock
from .schemas import BBox, OcrLine


def group_blocks_into_rows(blocks: list[OcrBlock]) -> list[OcrLine]:
    """
    Groups individual OCR text blocks into coherent horizontal lines/rows:
    1. Sorts all blocks by vertical center.
    2. Clusters blocks into the same row if vertical centers overlap within a dynamic height tolerance.
    3. Sorts blocks within each row horizontally from left to right.
    4. Concatenates block texts with a single space.
    5. Computes the conservative minimum confidence across blocks in the row.
    6. Constructs a composite bounding box covering the entire line.
    """
    if not blocks:
        return []

    # Sort blocks initially by vertical center, then by left x
    def sort_key(b: OcrBlock) -> tuple[float, int]:
        y_center = (b.bbox[1] + b.bbox[3]) / 2.0
        return y_center, b.bbox[0]

    sorted_blocks = sorted(blocks, key=sort_key)

    rows: list[list[OcrBlock]] = []

    for block in sorted_blocks:
        b_y1, b_y2 = block.bbox[1], block.bbox[3]
        b_center = (b_y1 + b_y2) / 2.0
        b_height = max(1, b_y2 - b_y1)

        placed = False

        for row in rows:
            # Calculate average vertical center and height of the current row
            row_centers = [(rb.bbox[1] + rb.bbox[3]) / 2.0 for rb in row]
            row_heights = [rb.bbox[3] - rb.bbox[1] for rb in row]

            avg_center = sum(row_centers) / len(row_centers)
            avg_height = sum(row_heights) / len(row_heights)

            # Tolerance: max of 60% of average block height or 10 pixels
            tolerance = max(0.6 * avg_height, 10.0)

            if abs(b_center - avg_center) <= tolerance:
                row.append(block)
                placed = True
                break

        if not placed:
            rows.append([block])

    # Sort rows top-to-bottom based on average y_center
    def row_y_center(row: list[OcrBlock]) -> float:
        return sum((b.bbox[1] + b.bbox[3]) / 2.0 for b in row) / len(row)

    rows.sort(key=row_y_center)

    lines: list[OcrLine] = []

    for row in rows:
        # Sort blocks within the row left-to-right
        row.sort(key=lambda b: b.bbox[0])

        joined_text = " ".join(b.text for b in row if b.text).strip()
        if not joined_text:
            continue

        # Compute row bounding box covering all constituent blocks
        x1 = min(b.bbox[0] for b in row)
        y1 = min(b.bbox[1] for b in row)
        x2 = max(b.bbox[2] for b in row)
        y2 = max(b.bbox[3] for b in row)

        # Conservative row confidence: minimum confidence among blocks in this row
        # (guarantees that an uncertain token in a wagon number is not hidden by high-confidence tokens)
        row_confidence = min(b.confidence for b in row)
        row_confidence = round(row_confidence, 4)

        lines.append(
            OcrLine(
                text=joined_text,
                confidence=row_confidence,
                bbox=BBox(x1=x1, y1=y1, x2=x2, y2=y2),
            )
        )

    return lines
