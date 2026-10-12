"""Generates a synthetic railway table image for OCR smoke tests."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


def generate_synthetic_table(output_path: Path) -> Path:
    width, height = 900, 400
    img = Image.new("RGB", (width, height), color="white")
    draw = ImageDraw.Draw(img)

    # Use default bitmap font
    font = ImageFont.load_default()

    lines = [
        "REJIM    SERI    VAGON NO    VARIS",
        "3175     2461    776-8       KAYSERI",
        "3175     2752    262-5       ARIFIYE",
        "2175     3302    474-1       IZMIT",
    ]

    # Draw table border & grid lines
    draw.rectangle([40, 30, 860, 350], outline="black", width=2)
    draw.line([40, 100, 860, 100], fill="black", width=2)

    y_offset = 60
    for idx, line in enumerate(lines):
        # Draw text enlarged / visible
        draw.text((60, y_offset), line, fill="black", font=font)
        y_offset += 70

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, "PNG")
    return output_path


if __name__ == "__main__":
    out = Path(__file__).parent / "synthetic_railway_table.png"
    generate_synthetic_table(out)
    print(f"Generated {out}")
