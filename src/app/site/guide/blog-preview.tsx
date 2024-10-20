import React, { useEffect, useState } from 'react';
import { MDXRemote } from 'next-mdx-remote'; // Static import
import Image from 'next/image';

// Utility function to get initials from a name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('');
};

// Utility function to estimate reading time based on word count
const estimateReadingTime = (text: string) => {
  const wordsPerMinute = 150; // Average reading speed
  const wordCount = text.split(/\s+/).length; // Split by whitespace to get word count
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
};

interface BlogPreviewProps {
  source: any; // Update the type to any since MDXRemoteSerializeResult is not recognized with dynamic imports
  frontMatter: {
    title: string;
    subTitle?: string;
    publishedAt: string;
    imageUrl: string;
    summary: string;
    author: string;
    authorImg: string;
    tags: { id: number; name: string }[];
    topic: { id: number; name: string };
  };
}

const tagColors = [
  'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-600 dark:text-indigo-400',
  'bg-sky-100 dark:bg-sky-500/30 text-sky-600 dark:text-sky-400',
  'bg-emerald-100 dark:bg-emerald-400/30 text-emerald-600 dark:text-emerald-400',
  'bg-amber-100 dark:bg-amber-400/30 text-amber-600 dark:text-amber-400',
  'bg-rose-100 dark:bg-rose-500/30 text-rose-500 dark:text-rose-400',
  'bg-blue-100 dark:bg-blue-500/30 text-blue-600 dark:text-blue-500',
  'bg-slate-100 dark:bg-slate-300 text-slate-500 dark:text-slate-600',
  'bg-slate-700 text-slate-100 dark:text-slate-400',
];

// Custom MDX components to render header, topic, tags, etc.
const Header = ({ title, subTitle, topic, author, publishedAt, tags, imageUrl }) => {
  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const getColorForTag = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  return (
    <header className="mb-1 mt-1">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-left text-gray-900 dark:text-white mb-3">
        {title}
      </h1>
      {subTitle && (
        <h2 className="text-xl font-medium mb-6 text-left text-gray-600 dark:text-gray-300">
          {subTitle}
        </h2>
      )}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="flex items-center justify-center bg-slate-200 dark:bg-slate-800 rounded-full w-12 h-12 text-lg font-bold uppercase text-slate-700 dark:text-slate-400">
            {getInitials(author)}
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{author}</p>
            <span className="text-sm text-gray-500 dark:text-gray-400">{formattedDate}</span>
          </div>
        </div>
        {/* <div className="flex flex-wrap gap-2">
          {tags?.map((tag, index) => (
            <div key={tag.id} className="m-1">
              <div className={`text-xs inline-flex items-center font-medium rounded-full px-3 py-1 ${getColorForTag(index)}`}>
                {tag.name}
              </div>
            </div>
          ))}
        </div> */}
      </div>
      {imageUrl && (
        <div className="flex justify-center mb-8">
          <Image
            src={imageUrl}
            alt={title}
            width={960}
            height={540}
            className="rounded-lg shadow-md object-cover"
            unoptimized
          />
        </div>
      )}
    </header>
  );
};

const components = {
  Image,
  // Add other custom components here if needed
};

const BlogPreview = ({ source, frontMatter }: BlogPreviewProps) => {
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    const contentText = document.querySelector('.prose')?.textContent || '';
    setReadingTime(estimateReadingTime(contentText));
  }, [source]);

  return (
    <div className="py-12">
        <Header {...frontMatter} subTitle={frontMatter.subTitle || ''} />
        <article className="prose lg:prose-xl dark:prose-invert mx-auto leading-relaxed">
          <MDXRemote {...source} components={components} />
        </article>
    </div>
  );
};

export default BlogPreview;
