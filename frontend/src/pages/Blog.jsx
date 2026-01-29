import { useEffect, useState } from "react";
import { sanityClient } from "../lib/sanity";
import { Link } from "react-router-dom";

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    sanityClient
      .fetch(`*[_type == "post"] | order(publishedAt desc) {
        title, slug, excerpt
      }`)
      .then(setPosts);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      {posts.map(post => (
        <div key={post.slug.current} className="mb-6">
          <h2 className="text-xl font-semibold">
            <Link to={`/blog/${post.slug.current}`}>
              {post.title}
            </Link>
          </h2>
          <p className="text-gray-600">{post.excerpt}</p>
        </div>
      ))}
    </div>
  );
}
