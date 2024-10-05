'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // To dynamically fetch accountId
import BlogsTableItem, { Blog } from './blog-table-items';
import ModalBlank from '@/components/modal-blank';
import { getBlogs, deleteBlog } from '@/lib/queries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination'; // Import your pagination component

export default function BlogsTable() {
  const { accountId } = useParams(); // Fetch the accountId from the route
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dangerModalOpen, setDangerModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  // Fetch blogs using the query function from queries.ts
  useEffect(() => {
    const fetchBlogs = async () => {
      const data = await getBlogs();
      setBlogs(data);
      setFilteredBlogs(data);
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    let filtered = blogs;

    if (filter !== 'all') {
      filtered = filtered.filter((blog) => blog.status.toLowerCase() === filter);
    }

    if (search) {
      filtered = filtered.filter((blog) =>
        blog.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredBlogs(filtered);
  }, [filter, search, blogs]);

  const handleDeleteClick = (blog: Blog) => {
    setBlogToDelete(blog);
    setDangerModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (blogToDelete) {
      deleteBlog(blogToDelete.id).then(() => {
        setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== blogToDelete.id));
        setDangerModalOpen(false);
      });
    }
  };

  const indexOfLastBlog = currentPage * itemsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - itemsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700 relative">
      <header className="px-5 py-4 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">
          Blogs <span className="text-slate-400 dark:text-slate-500 font-medium">({filteredBlogs.length})</span>
        </h2>

        <div className="flex space-x-4">
          <div className="flex items-center">
            <Search className="text-slate-500" />
            <Input
              placeholder="Search by title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-2 h-10"
            />
          </div>
          <div>
            <select
              className="form-select rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-800 h-10"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <Link href={`/account/${accountId}/blog/new`} passHref>
            <Button variant="default" className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-1" />
              Create Blog
            </Button>
          </Link>
        </div>
      </header>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-2 py-3">Select</TableHead>
              <TableHead className="px-2 py-3">Title</TableHead>
              <TableHead className="px-2 py-3">Author</TableHead>
              <TableHead className="px-2 py-3">Published At</TableHead>
              <TableHead className="px-2 py-3">Status</TableHead>
              <TableHead className="px-2 py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentBlogs.length ? (
              currentBlogs.map((blog) => (
                <BlogsTableItem
                  key={blog.id}
                  blog={blog}
                  onDelete={() => handleDeleteClick(blog)}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationPrevious
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, i) => (
            <PaginationLink
              key={i + 1}
              isActive={currentPage === i + 1}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </PaginationLink>
          ))}
          {totalPages > 5 && <PaginationEllipsis />}
          <PaginationNext
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          />
        </PaginationContent>
      </Pagination>

      <ModalBlank isOpen={dangerModalOpen} setIsOpen={setDangerModalOpen}>
        <div className="p-5">
          <h2 className="text-lg font-semibold">Are you sure you want to delete this blog?</h2>
          <p className="text-sm text-slate-500">
            This action cannot be undone. Once deleted, the blog will be removed permanently.
          </p>
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDangerModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </ModalBlank>
    </div>
  );
}
