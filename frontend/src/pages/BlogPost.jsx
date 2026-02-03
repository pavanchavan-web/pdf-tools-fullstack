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
          body
        }`,
                { slug }
            )
            .then(setPost);
    }, [slug]);

    if (!post) return null;

    return (
        <div className="bg-white">
            {/* SEO */}
            <Helmet>
                {/* Title */}
                <title>{post.title} | ConvertZip Blog</title>

                {/* Meta Description */}
                <meta
                    name="description"
                    content={post.excerpt}
                />

                {/* Open Graph – Article */}
                <meta
                    property="og:title"
                    content={`${post.title} | ConvertZip Blog`}
                />
                <meta
                    property="og:description"
                    content={post.excerpt}
                />
                <meta
                    property="og:url"
                    content={window.location.href}
                />
                <meta
                    property="og:type"
                    content="article"
                />

                {/* OG Image (featured image preferred) */}
                <meta
                    property="og:image"
                    content={post.featuredImage || "https://convertzip.com/og-blog.png"}
                />

                {/* Optional Article Meta (extra SEO boost) */}
                <meta
                    property="article:published_time"
                    content={post.publishedAt}
                />
                <meta
                    property="article:author"
                    content="ConvertZip"
                />
            </Helmet>


            <div className="mb-4 leading-tight bg-gray-100 text-center py-20 flex flex-col items-center justify-center gap-[30px]">
                {/* TITLE */}
                <h1 className="text-3xl max-w-3xl md:text-4xl font-bold text-center">
                    {post.title}
                </h1>

                {/* DATE */}
                {post.publishedAt && (
                    <p className="text-md text-gray-500 mb-6">
                        {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                )}
            </div >

            <article className="max-w-3xl mx-auto px-4 py-8 blogpost-content">
                {/* COVER IMAGE */}
                {post.mainImage && (
                    <img
                        src={urlFor(post.mainImage).width(1200).height(630).fit("crop").url()}
                        alt={post.title}
                        className="w-full rounded-xl mb-8"
                        loading="lazy"
                    />
                )}

                {/* body */}
                <div className="prose prose-lg max-w-none">
                    <PortableText value={post.body} />
                </div>
            </article>
        </div>
    );
}
