import ImageConvert from "./ImageConvert";

export default function ConvertToJpeg() {
  return (
    <ImageConvert
      targetFormat="jpeg"
      title="Convert to JPEG"
      desc="Convert PNG, JPG, JPEG, GIF, TIFF, AVIF, BMP, or RAW images format to JPEG online in bulk with zero quality loss."
      maxText="Max 20 images per upload"
    />
  );
}
