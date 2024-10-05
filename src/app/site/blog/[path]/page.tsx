'use client';

import React, { useEffect, useState } from 'react';
import BlogPreview from '@/components/blog-preview';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import Head from 'next/head';

interface Blog {
  id: number;
  title: string;
  subTitle: string;
  content: string;
  author: string;
  publishedAt: string;
  status: string;
  path: string;
  topicId: number;
  topic: { id: number; name: string };
  blogTags: BlogTag[];
  excerpt: string;
  imageUrl: string;
}

interface Topic {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface BlogTag {
  blogId: number;
  tagId: number;
  tag: Tag;
}

interface BlogPostProps {
  params: { path: string };
}

const BlogPost = ({ params }: BlogPostProps) => {
  const { path } = params;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [mdxSource, setMdxSource] = useState<any>(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await fetch(`https://localhost:49153/api/blogs/path/${path}`);
        if (!response.ok) {
          console.error('Failed to fetch blog:', response.statusText);
          return;
        }

        const blogData = await response.json();
        setBlog(blogData);

        // Dynamically import the serialize function
        const { serialize } = await import('next-mdx-remote/serialize');
        const mdxSource = await serialize(blogData.content);
        setMdxSource(mdxSource);
      } catch (error) {
        console.error('Error fetching blog:', error);
      }
    };

    fetchBlogData();
  }, [path]);

  if (!blog || !mdxSource) {
    return <div>Loading...</div>;
  }

  const frontMatter = {
    title: blog.title,
    subTitle: blog.subTitle,
    publishedAt: blog.publishedAt,
    image: blog.imageUrl,
    summary: blog.excerpt,
    author: blog.author,
    authorImg: blog.authorImg,
    tags: blog.blogTags?.map((bt: { tag: { id: number; name: string } }) => bt.tag),
    topic: blog.topic,
  };

  return (
    <>
      <Head>
        <title>{frontMatter.title}</title>
        <meta name="description" content={frontMatter.summary} />
        <meta name="author" content={frontMatter.author} />
        <meta property="og:title" content={frontMatter.title} />
        <meta property="og:description" content={frontMatter.summary} />
        <meta property="og:image" content={frontMatter.image} />
      </Head>
      <Header />
      <BlogPreview source={mdxSource} frontMatter={frontMatter} />
      <Footer />
    </>
  );
};

export default BlogPost;
