import ImageConvert from "./ImageConvert";

export default function ConvertToGif() {
  return (
    <ImageConvert
      targetFormat="gif"
      title="Convert to GIF"
      desc="Convert PNG, JPG, JPEG, GIF, TIFF, AVIF, BMP, or RAW images format to GIF online in bulk with zero quality loss."
      maxText="Max 20 images per upload"
    />
  );
}
