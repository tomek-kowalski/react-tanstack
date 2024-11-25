import { Link, useNavigate} from 'react-router-dom';
import { createNewEvent } from '../../util/http.js';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation } from '@tanstack/react-query';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { queryClient } from '../../util/http.js';

export default function NewEvent() {

  const {mutate, isPending, isError, error} =useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
      });
      navigate('/events');
    },
  });

  const navigate = useNavigate();

  function handleSubmit(formData) {
    mutate({event:formData});
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && 'Submitting...'}
        {!isPending && (
        <>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Create
          </button>
        </>
        )}

      </EventForm>
      {isError && <ErrorBlock 
        title="Failed to create event" 
        message={error.info?.message || 'Failed to create event. Please check your inputs and try again later'}/>}
    </Modal>
  );
}
