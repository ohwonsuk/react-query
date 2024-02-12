import { useQuery } from "@tanstack/react-query";

import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { fetchEvents } from "../../util/http.js";

export default function NewEventsSection() {
  // data는 fetch 통해서 받은 데이터이며, 데이터 받는 상황 모니터링을 위한 isPending
  // 오류값을 받는 경우 isError가 True, 에러메시지 확인은 error 속성에서 가능
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { max: 3 }],
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    // 다른 페이지 이동했다가 돌아올 때 캐시된 데이터 사용하는데 신규데이터 업데이트도 동시에
    // 이뤄지는데 staleTime 기본값은 '0'으로 즉시 업데이트하도록 하는데 5000ms(5초)로 설정하면 다른
    // 화면 이동했다가 5초이내 돌아오면 업데이트 요청을 하지 않음
    staleTime: 5000,
    // gcTime 은 캐쉬한 데이터 보관시간으로 defalut는 5분인데 30초로 조정하면 30분뒤 캐쉬데이터는 폐기됨
    // gcTime: 30000,
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    // fecthEvent 함수에 정의한 error 속성인 info값을 오류메시지로 표시
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || "Failed to fetch events."}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
