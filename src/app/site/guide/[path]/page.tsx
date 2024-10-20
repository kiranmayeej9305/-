'use client'; // This directive must be at the top

import React, { useEffect, useState } from 'react';
import BlogPreview from '../blog-preview' 
import Footer from '@/components/ui/footer';
import Head from 'next/head';
import { getBlogByPath } from '@/lib/queries';

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

interface BlogTag {
  blogId: number;
  tagId: number;
  tag: { id: number; name: string };
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
        const blogData = await getBlogByPath(path);
        setBlog({
          ...blogData,
          publishedAt: new Date(blogData.publishedAt).toISOString()
        });

        // Dynamically import the serialize function for MDX
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
    ...blog,
    tags: blog.blogTags.map((bt) => bt.tag),
    topic: blog.topic,
  };

  return (
    <>
      <Head>
        <title>{frontMatter.title}</title>
        <meta name="description" content={frontMatter.excerpt} />
        <meta name="author" content={frontMatter.author} />
        <meta property="og:title" content={frontMatter.title} />
        <meta property="og:description" content={frontMatter.excerpt} />
        <meta property="og:image" content={frontMatter.imageUrl} />
      </Head>
      <BlogPreview 
        source={mdxSource} 
        frontMatter={{
          ...frontMatter,
          summary: frontMatter.excerpt,
          authorImg: '/path/to/default/author/image.jpg' // You may need to adjust this path
        }} 
      />
      <Footer />
    </>
  );
};

export default BlogPost;
