import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { sanityClient } from "../lib/sanity";
import { PortableText } from "@portabletext/react";
import { Helmet } from "react-helmet-async";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(sanityClient);
const urlFor = source => builder.image(source);

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    sanityClient
      .fetch(
        `*[_type=="post" && slug.current==$slug][0]{
          title,
          excerpt,
          publishedAt,
          mainImage,
          blockContent
        }`,
        { slug }
      )
      .then(setPost);
  }, [slug]);

  if (!post) return null;

  return (
    <>
      {/* SEO */}
      <Helmet>
        <title>{post.title} | ConvertZip Blog</title>
        <meta name="description" blockContent={post.excerpt} />
      </Helmet>

      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* TITLE */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {post.title}
        </h1>

        {/* DATE */}
        {post.publishedAt && (
          <p className="text-sm text-gray-500 mb-6">
            {new Date(post.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}

        {/* COVER IMAGE */}
        {post.mainImage && (
          <img
            src={urlFor(post.mainImage).width(1200).height(630).fit("crop").url()}
            alt={post.title}
            className="w-full rounded-xl mb-8"
            loading="lazy"
          />
        )}

        {/* blockContent */}
        <div className="prose prose-lg max-w-none">
          <PortableText value={post.blockContent} />
        </div>
      </article>
    </>
  );
}
