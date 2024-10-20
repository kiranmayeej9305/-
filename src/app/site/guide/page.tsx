'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getTopicsWithBlogs, getBlogByPath } from '@/lib/queries';
import { ChevronDown, ChevronRight } from 'lucide-react'; // For tree view icons
import BlogPreview from './blog-preview';
import { serialize } from 'next-mdx-remote/serialize';
import Footer from '@/components/ui/footer';

interface BlogPost {
  summary: string;
  id: number;
  title: string;
  subTitle: string;
  content: string;
  author: string;
  path: string;
  publishedAt: string;
  imageUrl: string;
  topic: { id: number; name: string };
  blogTags: { tag: { id: number; name: string } }[];
}

interface Topic {
  id: number;
  name: string;
  blogs: BlogPost[];
}

export default function BlogMenu() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null); // For topic expansion
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [serializedContent, setSerializedContent] = useState(null); // State for MDX content
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Fetch topics and their blogs
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsData = await getTopicsWithBlogs();
        setTopics(topicsData.map(topic => ({
          id: topic.id,
          name: topic.name,
          blogs: topic.blogs.map(blog => ({
            id: blog.id,
            title: blog.title,
            subTitle: '',
            content: '',
            author: '',
            path: blog.path,
            publishedAt: blog.publishedAt instanceof Date ? blog.publishedAt.toISOString() : blog.publishedAt,
            imageUrl: '',
            summary: '',
            topic: {
              id: blog.topic.id,
              name: blog.topic.name
            },
            blogTags: blog.blogTags.map(tag => ({
              tag: {
                id: tag.tag.id,
                name: tag.tag.name
              }
            }))
          }))
        })));
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);

  const handleTopicToggle = (topicId: number) => {
    setExpandedTopic((prev) => (prev === topicId ? null : topicId));
  };

  const handleBlogClick = async (blogPath: string) => {
    try {
      const blogData = await getBlogByPath(blogPath);
      const serialized = await serialize(blogData.content);
      setSelectedBlog({
        ...blogData,
        summary: (blogData as any).summary || '', // Type assertion to avoid TypeScript error
        publishedAt: blogData.publishedAt instanceof Date ? blogData.publishedAt.toISOString() : blogData.publishedAt
      });
      setSerializedContent(serialized);
    } catch (error) {
      console.error('Error fetching blog:', error);
    }
  };

  return (
    <>
      <section className="relative bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="relative max-w-3xl mx-auto pb-12 md:pb-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 rounded-lg -z-10"></div>
            <h1 className="relative text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white mb-4 z-10">
              Discover, Learn, & Grow
            </h1>
            <p className="relative text-base text-gray-700 dark:text-gray-300 leading-relaxed z-10">
              Stay informed with insightful articles on the latest trends in software development, technology news, and industry best practices.
            </p>
          </div>
          <div className="flex flex-grow h-full">
            {/* Sidebar */}
            <aside
              ref={sidebarRef}
              className="w-[268px] border-r bg-gray-50 dark:bg-gray-900 shrink-0 sticky top-24 h-screen overflow-y-auto no-scrollbar"
            >
              <div className="px-6 py-4">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">Documentation</h2>
                <nav className="space-y-4">
                  {topics.map((topic) => (
                    <div key={topic.id}>
                      <div
                        className="flex justify-between items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => handleTopicToggle(topic.id)}
                      >
                        <span className="font-medium text-gray-800 dark:text-gray-200">{topic.name}</span>
                        {expandedTopic === topic.id ? <ChevronDown /> : <ChevronRight />}
                      </div>
                      {expandedTopic === topic.id && (
                        <ul className="ml-4 mt-2 space-y-2 text-gray-700 dark:text-gray-300">
                          {topic.blogs.map((blog) => (
                            <li key={blog.id} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                              {/* No link needed, render content on click */}
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault(); // Prevent default link behavior
                                  handleBlogClick(blog.path);
                                }}
                              >
                                {blog.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto">
              {selectedBlog && serializedContent ? (
                <BlogPreview
                  source={serializedContent}
                  frontMatter={{
                    title: selectedBlog.title,
                    subTitle: selectedBlog.subTitle || '',
                    publishedAt: selectedBlog.publishedAt,
                    imageUrl: selectedBlog.imageUrl || '',
                    summary: selectedBlog.summary || '',
                    author: selectedBlog.author || 'Author Name',
                    authorImg: selectedBlog.author || '',
                    tags: selectedBlog.blogTags.map((tagObj) => ({ id: tagObj.tag.id, name: tagObj.tag.name })),
                    topic: selectedBlog.topic,
                  }}
                />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
                  Please select a topic and article to view its content.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
