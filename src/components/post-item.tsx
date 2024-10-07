'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogTagsById } from '@/lib/queries';
import { LucideArrowRight } from 'lucide-react';

interface Tag {
  id: number;
  name: string;
}

interface BlogTag {
  tag: Tag;
}

interface PostItemProps {
  id: number;
  title: string;
  subTitle?: string;
  summary: string;
  slug: string;
  author: string;
  authorImg?: string;
  publishedAt: string;
  imageUrl?: string;
  topic?: { id: number; name: string };
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('');
};

const tagColors = [
  'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-600 dark:text-indigo-400',
  'bg-sky-100 dark:bg-sky-500/30 text-sky-600 dark:text-sky-400',
  'bg-emerald-100 dark:bg-emerald-400/30 text-emerald-600 dark:text-emerald-400',
  'bg-amber-100 dark:bg-amber-400/30 text-amber-600 dark:text-amber-400',
];

const getColorForTag = (index: number) => {
  return tagColors[index % tagColors.length];
};

const PostItem = ({ id, title, subTitle, summary, slug, author, authorImg, publishedAt, imageUrl, topic }: PostItemProps) => {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data: BlogTag[] = await getBlogTagsById(id);
        setTags(data.map((blogTag) => blogTag.tag));
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };

    fetchTags();
  }, [id]);

  return (
    <article className="flex flex-col lg:flex-row items-start lg:items-center border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg transition-shadow duration-300 ease-in-out">
      {imageUrl && (
        <div className="w-full lg:w-1/4 mb-4 lg:mb-0 lg:mr-6">
          <Image className="rounded-md shadow-sm" src={imageUrl} width={300} height={200} alt={title} />
        </div>
      )}
      <div className="flex-grow">
        <header>
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((tag, index) => (
              <div key={tag.id} className={`text-xs inline-flex items-center font-medium rounded-full px-2.5 py-1 ${getColorForTag(index)}`}>
                {tag.name}
              </div>
            ))}
          </div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
            <Link href={`/blogs/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h2>
        </header>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {summary}
        </div>
        <footer className="text-xs flex items-center space-x-4">
          <div className="flex items-center">
            <div className="flex shrink-0 mr-2">
              {authorImg ? (
                <Image className="rounded-full" src={authorImg} width={24} height={24} alt={author} />
              ) : (
                <div className="relative rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center w-6 h-6 text-gray-700 dark:text-gray-300">
                  {getInitials(author)}
                </div>
              )}
            </div>
            <div>
              <span className="text-gray-700 dark:text-gray-400">By </span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{author}</span>
            </div>
          </div>
          <span className="text-gray-500 dark:text-gray-400">{new Date(publishedAt).toLocaleDateString()}</span>
        </footer>
      </div>
      <div className="mt-4 lg:mt-0 lg:ml-6">
        <Link href={`/blogs/${slug}`}>
          <span className="inline-flex items-center font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition duration-300 cursor-pointer">
            <LucideArrowRight className="ml-1 w-4 h-4" />
          </span>
        </Link>
      </div>
    </article>
  );
};

export default PostItem;
