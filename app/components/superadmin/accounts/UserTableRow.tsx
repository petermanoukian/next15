import Image from 'next/image';
import Link from 'next/link';

export interface Userr {
  id: number;
  name: string;
  email: string;
  is_admin: string;
  image_url: string;
  file_url?: string | null;
}

export interface UserPerformer {
  id: number;
  name: string;
  email: string;
  is_admin: string | null; // Adjusted to match actual user object
}

interface Props {
  userr: Userr;
  user: UserPerformer | null;
  handleDelete: (id: number) => void;
    isSelected: boolean;
  toggleSelectUser: (id: number) => void;

}

const UserTableRow: React.FC<Props> = ({ userr, user, handleDelete,isSelected,toggleSelectUser}) => {
  return (
    <tr className="text-center">

    <td className="border p-2">
      { (user?.is_admin === 'superadmin' && user?.id !== userr.id) ? (
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => toggleSelectUser(userr.id)}
      />
      )
      : (
    <span className="text-red-500 line-through font-mono text-lg">X</span>)

      
      
      }
    </td>



      <td className="border p-2">{userr.id}</td>
      <td className="border p-2">{userr.name}</td>
      <td className="border p-2">{userr.email}</td>
      <td className="border p-2">
        {userr.is_admin === 'orduser' ? 'User' : userr.is_admin}
      </td>
      <td className="border p-2"> 
        <Image
          src={userr.image_url}
          alt={userr.name || 'User Image'}
          width={100}
          height={100}
          unoptimized
        />
      </td>
      <td className="border p-2">
        {userr.file_url ? (
          <a
            href={userr.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View File
          </a>
        ) : (
          <span className="text-gray-400">No File</span>
        )}
      </td>
      <td className="border p-2 space-x-3">
        <div className="inline-block">
          <Link
            href={`/superadmin/user/edit/${userr.id}`}
            className="text-blue-600 hover:underline"
          >
            Edit
          </Link>
        </div>
        {user?.is_admin === 'superadmin' && user?.id !== userr.id && (
          <div className="inline-block">
            <button
              onClick={() => {
                handleDelete(userr.id);
              }}
              className="text-red-600 hover:underline ml-2"
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default UserTableRow;
