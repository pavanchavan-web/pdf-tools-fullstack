import ImageConvert from "./ImageConvert";

export default function ConvertToJpeg() {
  return (
    <ImageConvert
      targetFormat="jpeg"
      title="Convert to JPEG Online"
      desc="Convert PNG, JPG, WEBP, AVIF, GIF, TIFF, BMP, and RAW images to JPEG online. Free bulk JPEG/JPG image converter with high quality and no signup required."
      maxText="Max 20 images per upload"
    />
  );
}
