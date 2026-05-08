import { RepoCard } from '@/components/repository/RepoCard';
import type { Repository } from '@/features/repository/repository.types';
import type { User } from '@/features/user/user.types';

type RepoGridProps = {
  repositories: Repository[];
  users: User[];
  onRepoClick: (repository: Repository) => void;
};

export const RepoGrid = ({ repositories, users, onRepoClick }: RepoGridProps) => {
  const getAuthor = (authorId: string) => users.find((user) => user.id === authorId);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-2">
      {repositories.map((repository) => (
        <RepoCard
          key={repository.id}
          author={getAuthor(repository.authorId)}
          onClick={onRepoClick}
          repository={repository}
        />
      ))}
    </div>
  );
};

