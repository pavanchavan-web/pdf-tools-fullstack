import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { sanityClient } from "../lib/sanity";
import { PortableText } from "@portabletext/react";
import { Helmet } from "react-helmet-async";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    sanityClient
      .fetch(
        `*[_type=="post" && slug.current==$slug][0]`,
        { slug }
      )
      .then(setPost);
  }, [slug]);

  if (!post) return null;

  return (
    <>
      <Helmet>
        <title>{post.title} | ConvertZip Blog</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <article className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <PortableText value={post.content} />
      </article>
    </>
  );
}
