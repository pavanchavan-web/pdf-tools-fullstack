import ImageConvert from "./ImageConvert";

export default function ConvertToWebp() {
  return (
    <ImageConvert
      targetFormat="webp"
      title="Convert to WEBP"
      desc="Convert PNG, JPG, JPEG, GIF, TIFF, AVIF, BMP, JPG or RAW images format to WEBP online in bulk with zero quality loss."
      maxText="Max 20 images per upload"
    />
  );
}
