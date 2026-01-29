import { defineField, defineType } from "sanity";

export default defineType({
  name: "post",
  title: "Blog Post",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: "excerpt",
      title: "Excerpt (SEO Description)",
      type: "text",
      rows: 3,
      description:
        "Short summary shown on blog cards and used for SEO meta description",
      validation: Rule => Rule.required().max(160),
    }),

    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Main image shown on blog cards and blog page",
    }),

    defineField({
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),

    defineField({ 
      name: 'body', 
      title: 'Body', 
      type: 'blockContent', 
    }),
  ],

  preview: {
    select: {
      title: "title",
      media: "mainImage",
      subtitle: "publishedAt",
    },
  },
});
