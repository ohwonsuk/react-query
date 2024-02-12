import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const submit = useSubmit();
  const params = useParams();

  const { data, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 10000,
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  // onMutate 속성을 사용시 optimistic update로 쿼리데이터 업데이트 하여
  // - 백엔드로 수정데이터 업데이트 하는 동안
  // 캐싱되어 있는 폼데이터를 바로 적용, 만약 백엔드 저장실패시 롤백적용
  // onMutate: async (data) => {
  //   const newEvent = data.event;

  //   await queryClient.cancelQueries({ queryKey: ["events", params.id] });
  //   const previousEvent = queryClient.getQueryData(["events", params.id]);

  //   queryClient.setQueryData(["events", params.id], newEvent);

  //   return { previousEvent };
  // },
  // mutate 실패시 context에는 mutate에서 return된 previousEvent 값이 포함
  // onError: (error, data, context) => {
  //   queryClient.setQueryData(["events", params.id], context.previousEvent);
  // },
  //onSettled 는 mutate 성공/실패 상관없이 끝날 때 적용되는 속성. 백엔드에서 최신값 적용 (동기화)
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["events"]);
  //   },
  // });

  function handleSubmit(formData) {
    submit(formData, { method: "POST" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            "Failed to load event. Please check your inputs and try again later."
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          <p>Sending data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries(["events"]);
  return redirect("../");
}
