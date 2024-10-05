'use client';
import React, { useEffect, useState } from 'react';
import BlogsTable from '@/components/blog-table';
import { Blog } from '@/components/blog-table-items';
import { getBlogs } from '@/lib/queries'; // Fetches all blogs without dependency on accountId

function BlogsContent() {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getBlogs();  // Fetch all blogs
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold">Blogs</h1>
        </div>
      </div>
      <BlogsTable blogs={blogs} />
    </div>
  );
}

export default BlogsContent;
