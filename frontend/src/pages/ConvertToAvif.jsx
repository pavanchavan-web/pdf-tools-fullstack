import ImageConvert from "./ImageConvert";

export default function ConvertToAvif() {
  return (
    <ImageConvert
      targetFormat="avif"
      title="Convert to AVIF"
      desc="Convert PNG, JPG, JPEG, GIF, TIFF, AVIF, BMP, or RAW images format to AVIF online in bulk with zero quality loss."
      maxText="Max 20 images per upload"
    />
  );
}
