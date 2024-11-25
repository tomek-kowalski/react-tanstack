import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useQuery, useMutation} from '@tanstack/react-query';
import Header from '../Header.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useParams } from 'react-router-dom';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {

  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams(); 
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['events', params.id], 
    queryFn: ({signal}) => fetchEvent({signal, id:params.id}),
  });

  const {
    mutate, 
    isPending: isPendingDeletion, 
    isError: isErrorDeleting, 
    error:deleteError
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events', params.id],
        refetchType:'none'
      });
      navigate('/events');
    }, 
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({ id:params.id});
  }

  let content;

  if (isLoading) {
    <div id="event-details-content" className="center">
      content = <LoadingIndicator />;
    </div>
  } else if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock title="An error occurred" message={error?.info?.message || 'Failed to fetch detailed event'} />
      </div>
    );
  } else if (data) {

    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}` || ''} alt={data.title || 'Event image'} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location || 'Event Location'}</p>
              <time dateTime={`Todo-DateT&Todo-Time`}>{formattedDate } @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description || 'Event Description'}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>Do you really want to delete this event? This action cannot be undone.</p>
          <div className="form-actions">
            {isPendingDeletion && <p>Deleting, please wait...</p>}
            {!isPendingDeletion && (
              <>
                <button className="button-text" onClick={handleStopDelete}>Cancel</button>
                <button className="button" onClick={handleDelete}>Confirm</button>
              </>
            )}
            {isErrorDeleting && (
              <ErrorBlock 
                title="Failed to delete event" 
                message={deleteError.info?.message || 
                'Failed to detele event , please try again later.'
                }
                />
              )}
          </div>
        </Modal>)}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
      {content}
      </article>
    </>
  );
}
