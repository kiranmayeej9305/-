'use client'; // This directive must be at the top

import { useEffect, useState } from 'react';
import PostItem from '@/components/post-item';
import Topics from './topics/topics';
import Pagination from './pagination';
import Header from '@/components/ui/header';

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
      const response = await fetch(`https://localhost:49153/api/blogs/paginated?page=${currentPage}&pageSize=${postsPerPage}`);
      const data: PaginatedData = await response.json();
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    };

    fetchPosts();
  }, [currentPage]);

  return (
    <>
      <Header />
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">

            {/* Page header */}
            <div className="max-w-3xl pb-12 md:pb-20 text-center md:text-left">
              <h1 className="h1 mb-4">Type the way you talk</h1>
              <p className="text-xl text-gray-600">Stay up to date on the latest from Simple and best news from the Dev world.</p>
            </div>

            {/* Main content */}
            <div className="md:flex md:justify-between">

              {/* Articles container */}
              <div className="md:grow -mt-4">
                {posts.map((post, postIndex) => (
                  <PostItem
                    key={postIndex}
                    id={post.id}
                    title={post.title}
                    subTitle={post.subTitle}
                    summary={post.excerpt}
                    slug={post.path} // Use path as the slug
                    author={post.author}
                    authorImg={post.authorImg}
                    publishedAt={post.publishedAt}
                    imageUrl={post.imageUrl}
                    topic={post.topic} 
                    tags={post.tags}                  />
                ))}
                <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
              </div>

              {/* Sidebar */}
              <aside className="relative mt-12 md:mt-0 md:w-64 md:ml-12 lg:ml-20 md:shrink-0">
                {/* <PopularPosts /> */}
                <Topics />
              </aside>

            </div>

          </div>
        </div>
      </section>
    </>
  );
}
