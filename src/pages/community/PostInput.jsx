import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../../api/communityCardApi";
import useUserStore from "../../zustand/useUserStore";

const PostInput = ({ onPostAdded }) => {
  const { user } = useUserStore();
  const [content, setContent] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [tag, setTag] = useState(null);

  console.log(user);

  const predefinedTags = ["꿀팁", "후기", "기대", "음악", "추천", "기타"];
  const queryClient = useQueryClient();

  if (!user) {
    return <p>로그인 후 글을 작성할 수 있습니다.</p>;
  }

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (createdPost) => {
      queryClient.invalidateQueries(["posts"]);
      onPostAdded(createdPost);
      setContent("");
      setYoutubeLink("");
      setThumbnailUrl(null);
      setTag(null);
    },
    onError: (error) => {
      console.error("게시글 저장 중 오류 발생:", error);
      alert("게시글 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (!tag) {
      alert("태그를 선택해주세요!");
      return;
    }

    const newPost = {
      content,
      youtubeLink,
      thumbnailUrl,
      tag: `#${tag}`,
      date: new Date().toISOString(),
      likes: 0,
      comments: [],
      author: user.username,
      userId: user.id,
    };
    mutation.mutate(newPost);
  };

  // 유튜브 썸네일 가져오기
  const handleYoutubeLinkChange = (e) => {
    const link = e.target.value;
    setYoutubeLink(link);

    // 유튜브 비디오 ID 추출
    const videoIdMatch = link.match(
      /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/i
    );
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    if (videoId) {
      const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      setThumbnailUrl(thumbnail);
    } else {
      setThumbnailUrl(null);
    }
  };

  const handleTagChange = (e) => {
    setTag(e.target.value);
  };

  return (
    <div className="max-w-100 max-h-100 bg-gray-50 border-2 rounded border-primary m-10">
      <div className="relative w-full h-full rounded ">
        <div className="bg-gray-200 h-40 w-full rounded flex items-center justify-center">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="YouTube Thumbnail"
              className="h-full w-full object-cover rounded"
            />
          ) : (
            <div>
              <input
                type="text"
                value={youtubeLink}
                onChange={handleYoutubeLinkChange}
                placeholder="YouTube 링크 입력"
                className="text-gray-200 w-full p-2 text-center bg-gray-100"
              />
            </div>
          )}
        </div>
        <p className="text-black text-sm m-3">{user.username}</p>
        <textarea
          className="w-full h-20 bg-white border-solid border-gray-300 p-2 cursor-text"
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-between items-end m-4">
          <select
            value={tag || ""}
            onChange={handleTagChange}
            className="text-gray-500 rounded softBtn"
          >
            <option value="" disabled>
              #태그 선택 ▾
            </option>
            {predefinedTags.map((tagItem) => (
              <option key={tagItem} value={tagItem}>
                #{tagItem}
              </option>
            ))}
          </select>

          <button onClick={handleSubmit} className="btn">
            완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostInput;
