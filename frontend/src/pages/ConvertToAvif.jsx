import ImageConvert from "./ImageConvert";

export default function ConvertToAvif() {
  return (
    <ImageConvert
      targetFormat="avif"
      title="Convert to AVIF Online"
      desc="Convert JPG, PNG, JPEG, WEBP, GIF, TIFF, BMP, and RAW images to AVIF online. Free bulk AVIF image converter with high quality and no signup."
      maxText="Max 20 images per upload"
    />
  );
}
