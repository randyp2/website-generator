"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle, Reply, Send, ThumbsUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentReply {
  id: string;
  author: string;
  avatarUrl: string | null;
  body: string;
  timeAgo: string;
  likes: number;
}

interface Comment {
  id: string;
  author: string;
  avatarUrl: string | null;
  body: string;
  timeAgo: string;
  likes: number;
  replies: CommentReply[];
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    author: "Sophia Chen",
    avatarUrl: null,
    body: "Love the layout choices here! The hero section draws you in immediately. Would be cool to see a case-study breakdown for one of the projects.",
    timeAgo: "2 days ago",
    likes: 14,
    replies: [
      {
        id: "1-1",
        author: "Ethan Brooks",
        avatarUrl: null,
        body: "Agreed, the hero is really strong. A case study section would take this to the next level.",
        timeAgo: "1 day ago",
        likes: 5,
      },
    ],
  },
  {
    id: "2",
    author: "Marcus Rivera",
    avatarUrl: null,
    body: "Clean design, really nice work. The typography pairing is solid.",
    timeAgo: "5 days ago",
    likes: 9,
    replies: [],
  },
  {
    id: "3",
    author: "Ava Okafor",
    avatarUrl: null,
    body: "This is exactly the kind of portfolio I'd want to send to a recruiter. Minimal but still has personality.",
    timeAgo: "1 week ago",
    likes: 22,
    replies: [
      {
        id: "3-1",
        author: "Liam Nguyen",
        avatarUrl: null,
        body: "Same here. Bookmarking this for reference on my own redesign.",
        timeAgo: "6 days ago",
        likes: 8,
      },
      {
        id: "3-2",
        author: "Sophia Chen",
        avatarUrl: null,
        body: "Right? It hits that sweet spot between polished and personal.",
        timeAgo: "5 days ago",
        likes: 3,
      },
    ],
  },
  {
    id: "4",
    author: "Jordan Patel",
    avatarUrl: null,
    body: "The color palette works really well with the dark theme. Nice attention to contrast ratios too.",
    timeAgo: "2 weeks ago",
    likes: 7,
    replies: [],
  },
];

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getTotalCommentCount = (comments: Comment[]): number =>
  comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);

const PortfolioComments = () => {
  const [isOpen, setIsOpen] = useState(false);

  const commentCount = getTotalCommentCount(MOCK_COMMENTS);

  return (
    <article className="px-1 py-2 sm:px-2">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex w-full items-center justify-between rounded-lg py-2 text-left transition-colors"
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="size-5 text-primary" />
          <span className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
            Comments
          </span>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {commentCount}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-5 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-4 space-y-5">
            {MOCK_COMMENTS.map((comment, index) => (
              <div key={comment.id}>
                <div className="flex items-start gap-3">
                  <Avatar className="size-8">
                    {comment.avatarUrl ? (
                      <AvatarImage src={comment.avatarUrl} alt={comment.author} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {getInitials(comment.author)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {comment.author}
                      </span>
                      <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {comment.body}
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                      >
                        <ThumbsUp className="size-3.5" />
                        <span>{comment.likes}</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                      >
                        <Reply className="size-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>

                    {comment.replies.length > 0 && (
                      <div className="mt-4 space-y-4 border-l-2 border-border pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <Avatar className="size-6">
                              {reply.avatarUrl ? (
                                <AvatarImage src={reply.avatarUrl} alt={reply.author} />
                              ) : null}
                              <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                                {getInitials(reply.author)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  {reply.author}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {reply.timeAgo}
                                </span>
                              </div>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {reply.body}
                              </p>
                              <div className="mt-2 flex items-center gap-4">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                                >
                                  <ThumbsUp className="size-3" />
                                  <span>{reply.likes}</span>
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                                >
                                  <Reply className="size-3" />
                                  <span>Reply</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {index < MOCK_COMMENTS.length - 1 && (
                  <div className="mt-5 h-px w-full bg-border" />
                )}
              </div>
            ))}

            <div className="mt-2 flex items-center gap-3 pt-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                  ?
                </AvatarFallback>
              </Avatar>
              <div className="relative min-w-0 flex-1">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  disabled
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Send className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PortfolioComments;
