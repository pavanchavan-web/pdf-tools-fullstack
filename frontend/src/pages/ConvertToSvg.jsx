import ImageConvert from "./ImageConvert";

export default function ConvertToSvg() {
  return (
    <ImageConvert
      targetFormat="svg"
      title="Convert to SVG"
      desc="Convert WEBP, JPG, JPEG, GIF, TIFF, AVIF, BMP, JPG or RAW images format to SVG online in bulk with zero quality loss."
      maxText="Max 20 images per upload"
    />
  );
}
