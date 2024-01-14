import { allPosts } from ".contentlayer/generated";
import Link from "next/link";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

export default function Home() {
  console.log("🚀 ~ allPosts:", allPosts);
  const posts = allPosts.sort((a, b) => dayjs(b?.date || "").unix() - dayjs(a?.date || "").unix());

  return (
    <div className="prose dark:prose-invert">
      {posts.map((post) => (
        <Link href={post.slug} key={post._id} className="no-underline">
          <article key={post._id}>
            <h2>{post.title}</h2>
            {post.description && <div className="line-clamp-3">{post.description}</div>}
          </article>
          <p>{dayjs(post.date).format("LLL")}</p>
        </Link>
      ))}
    </div>
  );
}
