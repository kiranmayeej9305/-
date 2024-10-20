'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { serialize } from 'next-mdx-remote/serialize';
import CreatableSelect from 'react-select/creatable';
import BlogPreview from '@/components/blog-preview';
import { getBlogById, getTopics, getTags, createTag, createTopic, upsertBlog } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { UploadDropzone } from '@/lib/uploadthing';

const RichTextEditor = dynamic(() => import('@/components/rich-text-editor'), { ssr: false });

const BlogForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accountId } = useParams();
  const id: number = parseInt(searchParams.get('id') || '0');

  const [blog, setBlog] = useState({
    id: 0,
    title: '',
    subTitle: '',
    content: '',
    author: '',
    publishedAt: new Date(), // Ensure this is in string format
    status: 'Draft',
    path: '',
    topicId: 0,
    tags: [], // Ensure blogTags is included
    excerpt: '',
    imageUrl: '', // Cover image URL
  });

  const [topics, setTopics] = useState([]);
  const [tags, setTags] = useState([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [mdxSource, setMdxSource] = useState(null);

  // Fetch blog data using queries
  const fetchBlogData = async () => {
    if (id) {
      const blogData = await getBlogById(id);
      setBlog({ ...blogData, tags: (blogData as any).tags || [] });
      if (blogData.imageUrl) {
        setImagePreview(blogData.imageUrl);
      }
    }
  };

  // Fetch topics and tags using queries
  const fetchTopicsAndTags = async () => {
    const topicsData = await getTopics(100);
    setTopics(topicsData.map((topic: any) => ({ value: topic.id, label: topic.name })));

    const tagsData = await getTags();
    setTags(tagsData.map((tag: any) => ({ value: tag.id, label: tag.name })));
  };

  useEffect(() => {
    fetchTopicsAndTags();
    fetchBlogData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBlog((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContentChange = (content: string) => {
    setBlog((prev) => ({ ...prev, content }));
  };

  const generateSeoFriendlyUrl = (title: string) => {
    return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  };

  const handleSave = async (status: string) => {
    const path = generateSeoFriendlyUrl(blog.title);
    const formData = { ...blog, status, path };

    // Use upsertBlog query to save blog
    await upsertBlog(formData);
    router.push(`/account/${accountId}/blog/list`);
  };

  const handleAction = async (action: string) => {
    switch (action) {
      case 'publish':
        await handleSave('Published');
        break;
      case 'saveDraft':
        await handleSave('Draft');
        break;
      case 'preview':
        const mdxSource = await serialize(blog.content);
        setMdxSource(mdxSource);
        setIsPreview(true);
        break;
      default:
        break;
    }
  };

  const handleDiscard = () => {
    router.push(`/account/${accountId}/blog/list`);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold">{id ? 'Edit Blog' : 'Create Blog'}</h1>
        </div>
        <div className="flex space-x-2">
          {/* Buttons with ShadCN styling */}
          <Button variant="ghost" className="bg-black text-white hover:bg-gray-800" onClick={handleDiscard}>
            Discard
          </Button>
          <Button variant="default" className="bg-black text-white hover:bg-gray-800" onClick={() => handleAction('saveDraft')}>
            Save as Draft
          </Button>
          <Button variant="default" className="bg-black text-white hover:bg-gray-800" onClick={() => handleAction('preview')}>
            Preview
          </Button>
          <Button variant="default" className="bg-black text-white hover:bg-gray-800" onClick={() => handleAction('publish')}>
            Publish
          </Button>
        </div>
      </div>

      {isPreview ? (
        <BlogPreview
          source={mdxSource}
          frontMatter={{
            title: blog.title,
            subTitle: blog.subTitle,
            publishedAt: blog.publishedAt.toISOString(),
            imageUrl: blog.imageUrl,
            summary: blog.excerpt,
            author: blog.author,
            authorImg: '', // Add a default empty string or provide an actual author image URL
            tags: blog.tags.map((bt) => ({ id: bt.tag.id, name: bt.tag.name })),
            topic: topics.find((topic) => topic.id === blog.topicId) || { id: blog.topicId, name: '' },
          }}
        />
      ) : (
        <div className="p-5 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex space-x-2 mb-5">
            <input
              type="text"
              name="title"
              value={blog.title}
              onChange={handleChange}
              placeholder="Blog Title"
              className="form-input w-full"
            />
          </div>
          <div className="flex space-x-2 mb-5">
            <input
              type="text"
              name="subTitle"
              value={blog.subTitle}
              onChange={handleChange}
              placeholder="Optional Sub-Title for your blog"
              className="form-input w-full"
            />
          </div>
          <div className="mb-5">
            <textarea
              name="excerpt"
              value={blog.excerpt}
              onChange={handleChange}
              placeholder="Excerpt (for SEO and Google search)"
              className="form-textarea w-full"
              rows={3}
            />
          </div>

          {/* UploadThing Dropzone for the Cover Image */}
          <div className="mb-5">
            <UploadDropzone
              endpoint="media"
              onClientUploadComplete={(res) => {
                if (res) {
                  setBlog((prev) => ({ ...prev, imageUrl: res[0].url }));
                  setImagePreview(res[0].url);
                }
              }}
              onUploadError={() => {
                alert('Error while uploading the image. Please try again.');
              }}
              // Remove the multiple prop
            />
          </div>

          {imagePreview && (
            <div className="flex justify-center mb-5">
              <img src={imagePreview} alt="Cover Preview" className="w-full max-w-lg border border-gray-300 rounded-md" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="author"
              value={blog.author}
              onChange={handleChange}
              placeholder="Author Name"
              className="form-input w-full"
            />
            <input
              type="text"
              name="path"
              value={blog.path}
              onChange={handleChange}
              placeholder="Path"
              className="form-input w-full"
            />
            <input
              type="datetime-local"
              name="publishedAt"
              value={blog.publishedAt.toISOString().slice(0, 16)}
              onChange={handleChange}
              className="form-input w-full"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <CreatableSelect
              name="topicId"
              options={topics}
              value={topics.find((topic) => topic.value === blog.topicId)}
              onChange={(selected) => setBlog((prev) => ({ ...prev, topicId: selected ? selected.value : 0 }))}
              onCreateOption={async (inputValue) => {
                const createdTopic = await createTopic(inputValue);
                setTopics((prev) => [...prev, { value: createdTopic.id, label: createdTopic.name }]);
                setBlog((prev) => ({ ...prev, topicId: createdTopic.id }));
              }}
              placeholder="Select or create Topic"
              className="w-full"
            />
            <CreatableSelect
              isMulti
              name="tagId"
              onChange={(newValue) =>
                setBlog((prev) => ({
                  ...prev,
                  tags: newValue ? newValue.map((tag) => ({ blogId: prev.id, tagId: tag.value, tag: { id: tag.value, name: tag.label } })) : [],

                }))
              }
              onCreateOption={async (inputValue) => {
                const createdTag = await createTag(inputValue);
                setTags((prev) => [...prev, { value: createdTag.id, label: createdTag.name }]);
              }}
              options={tags}
              value={blog.tags?.map((bt) => ({ value: bt.tagId, label: bt.tag.name }))}
              placeholder="Select or create Tags"
              className="w-full"
            />
          </div>
          <div className="mt-4">
            <RichTextEditor value={blog.content} onChange={handleContentChange} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogForm;
