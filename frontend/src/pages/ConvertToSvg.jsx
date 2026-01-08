import ImageConvert from "./ImageConvert";

export default function ConvertToSvg() {
  return (
    <ImageConvert
      targetFormat="svg"
      title="SVG to Others"
      desc="Convert SVG format to WEBP, JPG, JPEG, GIF, TIFF, AVIF, PNG online in bulk with zero quality loss."
      maxText="Max 20 images per upload"
    />
  );
}
