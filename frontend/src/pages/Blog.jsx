import { useEffect, useState } from "react";
import { sanityClient } from "../lib/sanity";
import { Link } from "react-router-dom";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(sanityClient);
const urlFor = source => builder.image(source);

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    sanityClient
      .fetch(`
        *[_type == "post"] | order(publishedAt desc) {
          title,
          slug,
          excerpt,
          publishedAt,
          mainImage
        }
      `)
      .then(setPosts);
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50 py-20" id="blogs">
      <div className="max-w-7xl mx-auto p-4">
        {/* ================= HERO ================= */}
        <div className="text-center mb-12">
          <h3 className="text-gray-600 font-normal mb-5">Blogs</h3>
          <h1 className="mb-20">Our Latest Blogs</h1>
        </div>

        {/* GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <article
              key={post.slug.current}
              className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition"
            >
              {/* IMAGE */}
              {post.mainImage && (
                <Link to={`/blog/${post.slug.current}`}>
                  <img
                    src={urlFor(post.mainImage).width(600).height(350).fit("crop").url()}
                    alt={post.title}
                    className="w-full h-50 object-cover"
                    loading="lazy"
                  />
                </Link>
              )}

              {/* blockContent */}
              <div className="blog-post p-5">
                {/* DATE */}
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                {/* TITLE */}
                <h2 className="text-lg font-semibold mb-2 leading-snug">
                  <Link
                    to={`/blog/${post.slug.current}`}
                    className="hover:text-indigo-600"
                  >
                    {post.title}
                  </Link>
                </h2>

                {/* EXCERPT */}
                <p className="text-gray-600 text-sm line-clamp-3">
                  {post.excerpt}
                </p>

                {/* READ MORE */}
                <Link
                  to={`/blog/${post.slug.current}`}
                  className="inline-block mt-4 text-indigo-600 font-medium text-sm hover:underline"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
