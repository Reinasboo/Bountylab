import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table'
import { Developer } from '@/types/developer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Heart, ArrowUpDown } from 'lucide-react'
import { useCandidateStore } from '@/store/useCandidateStore'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface DeveloperTableProps {
  developers: Developer[]
}

export function DeveloperTable({ developers }: DeveloperTableProps) {
  const navigate = useNavigate()
  const { isCandidateSaved, addCandidate, removeCandidate } = useCandidateStore()
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<Developer>[]>(
    () => [
      {
        accessorKey: 'login',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            Developer
            <ArrowUpDown className="ml-2" size={16} />
          </Button>
        ),
        cell: ({ row }) => {
          const developer = row.original
          return (
            <Button
              variant="ghost"
              onClick={() => navigate(`/developer/${developer.login}`)}
              className="justify-start hover:bg-transparent"
            >
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={developer.avatar_url} />
                <AvatarFallback>{developer.login.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold">{developer.name || developer.login}</p>
                <p className="text-xs text-muted-foreground">@{developer.login}</p>
              </div>
            </Button>
          )
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => row.original.location || '-',
      },
      {
        accessorKey: 'followers',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            Followers
            <ArrowUpDown className="ml-2" size={16} />
          </Button>
        ),
        cell: ({ row }) => row.original.followers.toLocaleString(),
      },
      {
        accessorKey: 'total_stars',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            Stars
            <ArrowUpDown className="ml-2" size={16} />
          </Button>
        ),
        cell: ({ row }) => (row.original.total_stars || 0).toLocaleString(),
      },
      {
        accessorKey: 'top_languages',
        header: 'Languages',
        cell: ({ row }) => (
          <div className="flex gap-1 flex-wrap">
            {row.original.top_languages?.slice(0, 3).map(lang => (
              <Badge key={lang} variant="secondary" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'devrank_score',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            DevRank
            <ArrowUpDown className="ml-2" size={16} />
          </Button>
        ),
        cell: ({ row }) => row.original.devrank_score || '-',
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const developer = row.original
          const isStarred = isCandidateSaved(developer.id)
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isStarred) {
                  removeCandidate(developer.id)
                } else {
                  addCandidate(developer)
                }
              }}
              className={isStarred ? 'text-red-500' : ''}
            >
              <Heart className={isStarred ? 'fill-current' : ''} size={18} />
            </Button>
          )
        },
      },
    ],
    [navigate, isCandidateSaved, addCandidate, removeCandidate]
  )

  const table = useReactTable({
    data: developers,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-b hover:bg-muted/50 transition-colors">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-4 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {developers.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No developers found</p>
        </div>
      )}
    </Card>
  )
}
