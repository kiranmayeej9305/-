'use client';
import React, { useEffect, useState } from 'react';
import PostItem from '@/components/post-item';
import Topics from './topics/topics';
import Pagination from '@/components/pagination'; // Import your custom pagination component
import { getPaginatedBlogs } from '@/lib/queries';
import Footer from '@/components/ui/footer';

interface BlogPost {
  authorImg: string | undefined;
  tags: any;
  id: number;
  title: string;
  subTitle: string;
  content: string;
  author: string;
  path: string; // Use path for SEO-friendly URLs
  publishedAt: string;
  status: string;
  excerpt: string;
  imageUrl: string;
  topic: { id: number; name: string };
  blogTags: { tag: { id: number; name: string } }[];
}

interface PaginatedData {
  posts: BlogPost[];
  totalPages: number;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 5; // Adjust this value as needed

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPaginatedBlogs(currentPage, postsPerPage);
        setPosts(data.posts.map(post => ({
          ...post,
          authorImg: post.author || undefined,
          tags: post.blogTags.map(bt => bt.tag),
          publishedAt: new Date(post.publishedAt).toISOString(),
          subTitle: post.subTitle || '',
          content: post.content || '',
          path: post.path || '',
          excerpt: post.excerpt || '',
          imageUrl: post.imageUrl || '',
        })));
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching paginated blogs:', error);
      }
    };

    fetchPosts();
  }, [currentPage]);

  return (
    <>
    <section className="bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-20 md:pb-24">

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

          {/* Main content */}
          <div className="flex flex-col md:flex-row md:justify-between gap-12">

            {/* Articles container */}
            <div className="md:flex-grow">
              <div className="space-y-8">
                {posts.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    {posts.map((post, postIndex) => (
                      <PostItem
                        key={postIndex}
                        id={post.id}
                        title={post.title}
                        subTitle={post.subTitle}
                        summary={post.excerpt}
                        slug={post.path}
                        author={post.author}
                        authorImg={post.authorImg}
                        publishedAt={post.publishedAt}
                        imageUrl={post.imageUrl}
                        topic={post.topic}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400">No posts found.</div>
                )}
              </div>
              {totalPages > 0 && (
                <div className="flex justify-center mt-16">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="mt-12 md:mt-0 md:w-80 lg:w-96">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6">
                <Topics />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
    <Footer/>
    </>
  );
}
