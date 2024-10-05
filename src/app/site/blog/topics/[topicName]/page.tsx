'use client'; // This directive must be at the top

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PostItem from '@/components/post-item';
import Topics from '../topics';
import Header from '@/components/ui/header';

interface BlogPost {
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

export default function BlogByTopic() {
  const { topicName } = useParams<{ topicName: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    if (topicName) {
      const fetchPosts = async () => {
        try {
          setLoading(true);
          console.log(`Fetching posts for topic: ${topicName}`);
          const response = await fetch(`https://localhost:49153/api/blogs/topics/${topicName}`);
          const data = await response.json();
          console.log('Fetched data:', data);
          setPosts(Array.isArray(data) ? data : []); // Ensure data is an array
        } catch (error) {
          console.error('Failed to fetch posts:', error);
          setPosts([]); // Set an empty array on error
        } finally {
          setLoading(false);
        }
      };

      fetchPosts();
    }
  }, [topicName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">

            {/* Page header */}
            <div className="max-w-3xl pb-12 md:pb-20 text-center md:text-left">
              <h1 className="h1 mb-4">Posts on {topicName}</h1>
              <p className="text-xl text-gray-600">Explore all posts related to {topicName}.</p>
            </div>

            {/* Main content */}
            <div className="md:flex md:justify-between">

              {/* Articles container */}
              <div className="md:grow -mt-4">
                {posts.length > 0 ? (
                  posts.map((post, postIndex) => (
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
                      tags={post.blogTags?.map(bt => bt.tag)}
                    />
                  ))
                ) : (
                  <div>No posts found for {topicName}.</div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="relative mt-12 md:mt-0 md:w-64 md:ml-12 lg:ml-20 md:shrink-0">
                <Topics />
              </aside>

            </div>

          </div>
        </div>
      </section>
    </>
  );
}
