import ImageConvert from "./ImageConvert";

export default function ConvertToPng() {
  return (
    <ImageConvert
      targetFormat="png"
      title="Convert to PNG"
      desc="Convert WEBP, JPG, JPEG, GIF, TIFF, AVIF, BMP, JPG or RAW images format to PNG online in bulk with zero quality loss."
      maxText="Max 20 images per upload"
    />
  );
}
