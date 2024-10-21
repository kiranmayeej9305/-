import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // To dynamically fetch accountId

export interface Blog {
  id: number;
  title: string;
  author: string;
  publishedAt: string;
  status: string;
  tags: number[];
}

interface BlogTableItemProps {
  blog: Blog;
  onDelete: (id: number) => void;
  onSelect?: (id: number, selected: boolean) => void; // Optionally handle selection at the parent level
}
export default function BlogsTableItem({ blog, onDelete, onSelect }: BlogTableItemProps) {
  const params = useParams(); // Fetch the params from the route
  const accountId = params?.accountId; // Safely access accountId
  const [isSelected, setIsSelected] = useState(false);

  const handleCheckboxChange = () => {
    const newSelectionState = !isSelected;
    setIsSelected(newSelectionState);

    // If parent component wants to handle selection, call the onSelect prop
    if (onSelect) {
      onSelect(blog.id, newSelectionState);
    }
  };

  return (
    <tr>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
        <div className="flex items-center">
          <label className="inline-flex">
            <span className="sr-only">Select</span>
            <input
              className="form-checkbox"
              type="checkbox"
              onChange={handleCheckboxChange}
              checked={isSelected}
            />
          </label>
        </div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left">{blog.title}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left">{blog.author}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left">{new Date(blog.publishedAt).toLocaleDateString()}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left">{blog.status}</div>
      </td>
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
        <div className="text-left">
          <Link href={`/account/${accountId}/blog/edit?id=${blog.id}`}>
            <button className="text-blue-500 hover:text-blue-700">Edit</button>
          </Link>
          <button className="text-red-500 hover:text-red-700 ml-2" onClick={() => onDelete(blog.id)}>Delete</button>
        </div>
      </td>
    </tr>
  );
}
