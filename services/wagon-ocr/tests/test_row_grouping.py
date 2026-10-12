"""Unit tests for row grouping and text block clustering."""

import pytest
from app.ocr_engine import OcrBlock
from app.row_grouping import group_blocks_into_rows


def test_single_block_row_returns_block_directly():
    """Verify that a single isolated block produces one row with identical attributes."""
    blocks = [
        OcrBlock(text="31 75 083 4 521-8", confidence=0.985, bbox=[50, 100, 300, 140]),
    ]
    lines = group_blocks_into_rows(blocks)

    assert len(lines) == 1
    assert lines[0].text == "31 75 083 4 521-8"
    assert lines[0].confidence == 0.985
    assert lines[0].bbox.x1 == 50
    assert lines[0].bbox.y1 == 100
    assert lines[0].bbox.x2 == 300
    assert lines[0].bbox.y2 == 140


def test_horizontal_blocks_grouped_and_ordered_left_to_right():
    """Verify that blocks with similar vertical centers are grouped and sorted by x1."""
    # Blocks in arbitrary order horizontally on the same line (y: 100..140)
    blocks = [
        OcrBlock(text="Eanoss", confidence=0.95, bbox=[350, 102, 450, 138]),
        OcrBlock(text="31 75 083 4 521-8", confidence=0.99, bbox=[50, 100, 300, 140]),
        OcrBlock(text="24.5", confidence=0.88, bbox=[500, 105, 560, 139]),
    ]

    lines = group_blocks_into_rows(blocks)

    assert len(lines) == 1
    # Check left-to-right ordering and single space joining
    assert lines[0].text == "31 75 083 4 521-8 Eanoss 24.5"
    # Conservative confidence: minimum of [0.95, 0.99, 0.88]
    assert lines[0].confidence == 0.88
    # Enclosing bounding box
    assert lines[0].bbox.x1 == 50
    assert lines[0].bbox.y1 == 100
    assert lines[0].bbox.x2 == 560
    assert lines[0].bbox.y2 == 140


def test_top_to_bottom_ordering_of_distinct_rows():
    """Verify that vertically separated rows are ordered top-to-bottom."""
    blocks = [
        # Row 2 (y: 200..240)
        OcrBlock(text="ROW TWO", confidence=0.90, bbox=[50, 200, 200, 240]),
        # Row 1 (y: 50..90)
        OcrBlock(text="ROW ONE", confidence=0.92, bbox=[50, 50, 200, 90]),
        # Row 3 (y: 350..390)
        OcrBlock(text="ROW THREE", confidence=0.94, bbox=[50, 350, 200, 390]),
    ]

    lines = group_blocks_into_rows(blocks)

    assert len(lines) == 3
    assert lines[0].text == "ROW ONE"
    assert lines[1].text == "ROW TWO"
    assert lines[2].text == "ROW THREE"


def test_empty_blocks_returns_empty_list():
    """Verify that empty block input returns empty list."""
    assert group_blocks_into_rows([]) == []
