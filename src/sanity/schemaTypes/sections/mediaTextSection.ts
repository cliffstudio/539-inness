import { defineType, defineField } from "sanity";

export default defineType({
  name: "mediaTextSection",
  title: "Media & Text Section",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "ID",
      type: "string",
    }),
    defineField({
      name: "hide",
      title: "Hide Section",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Media with Text (big text)", value: "media-with-text-h5" },
          {
            title: "Media with Text (title & small text)",
            value: "media-with-text-h4-body",
          },
          {
            title: "Media with Text (room type)",
            value: "media-with-text-room-type",
          },
          {
            title: "Media with Text (title & bullet list)",
            value: "media-with-text-h4-bullet-list",
          },
          {
            title: "Media with Text (title, text & custom links block)",
            value: "media-with-text-h4-body-links",
          },
          {
            title: "Media with Text (big text & room links block)",
            value: "media-with-text-h4-body-room-links",
          },
          {
            title: "Media with Text (big text & calendar links block)",
            value: "media-with-text-h4-body-activity-links",
          },
        ],
      },
      initialValue: "media-with-text-h4-body",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      hidden: ({ parent }) =>
        parent?.layout !== "media-with-text-h4-body" &&
        parent?.layout !== "media-with-text-h4-bullet-list" &&
        parent?.layout !== "media-with-text-h4-body-links",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
      hidden: ({ parent }) =>
        parent?.layout === "media-with-text-room-type" ||
        parent?.layout === "media-with-text-h4-bullet-list",
    }),
    defineField({
      name: "bulletList",
      title: "Bullet List",
      type: "array",
      description: "Add each bullet as a separate list item.",
      of: [
        {
          type: "object",
          name: "bulletItem",
          fields: [
            {
              name: "body",
              title: "Body",
              type: "array",
              of: [{ type: "block" }],
            },
          ],
          preview: {
            select: {
              body: "body",
            },
            prepare({ body }) {
              const firstBlock = body?.[0];
              const text = firstBlock?.children?.[0]?.text;
              return {
                title: text || "Bullet Item",
              };
            },
          },
        },
      ],
      hidden: ({ parent }) =>
        parent?.layout !== "media-with-text-h4-bullet-list",
    }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      of: [{ type: "link" }],
      hidden: ({ parent }) =>
        parent?.layout !== "media-with-text-h4-body" &&
        parent?.layout !== "media-with-text-h4-body-room-links" &&
        parent?.layout !== "media-with-text-h4-body-links" &&
        parent?.layout !== "media-with-text-h4-bullet-list" &&
        parent?.layout !== "media-with-text-h4-body-activity-links",
    }),
    defineField({
      name: "roomLink",
      title: "Room Link",
      type: "reference",
      to: [{ type: "room" }],
      hidden: ({ parent }) => parent?.layout !== "media-with-text-room-type",
    }),
    defineField({
      name: "mediaType",
      title: "Media Type",
      type: "string",
      initialValue: "image",
      options: { list: ["image", "video"] },
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      hidden: ({ parent }) => parent?.mediaType !== "image",
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "bunnyVideo",
      hidden: ({ parent }) => parent?.mediaType !== "video",
    }),
    defineField({
      name: "mediaAlignment",
      title: "Media Alignment",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
      },
      initialValue: "right",
    }),
    defineField({
      name: "mediaOrientation",
      title: "Media Orientation",
      type: "string",
      options: {
        list: [
          { title: "Landscape", value: "landscape" },
          { title: "Portrait", value: "portrait" },
        ],
      },
      initialValue: "landscape",
      // hidden: ({ parent }) => parent?.layout !== "media-with-text-h4-body",
    }),
    defineField({
      name: "roomLinks",
      title: "Room Links",
      type: "array",
      of: [{ type: "reference", to: [{ type: "room" }] }],
      description: "Add Room Links in even numbers (2, 4, 6, etc.)",
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value || value.length === 0) return true;
          if (value.length < 2 || value.length % 2 !== 0) {
            return "Room Links must be added in even numbers (2, 4, 6, etc.)";
          }
          return true;
        }),
      hidden: ({ parent }) =>
        parent?.layout !== "media-with-text-h4-body-room-links",
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      of: [{ type: "detailedLink" }],
      description: "Add Links in sets of either 2 or 4.",
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value || value.length === 0) return true;
          if (![2, 4].includes(value.length)) {
            return "Links must be added in sets of either 2 or 4.";
          }
          return true;
        }),
      hidden: ({ parent }) =>
        parent?.layout !== "media-with-text-h4-body-links",
    }),
  ],
  preview: {
    select: {
      media: "images",
      mediaType: "mediaType",
    },
    prepare({ media, mediaType }) {
      return {
        title: "Media & Text Section",
        media: mediaType === "video" ? undefined : media?.[0],
      };
    },
  },
});
