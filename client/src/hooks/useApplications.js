import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useApplications() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    api.get('/applications/me')
      .then(({ data }) => {
        if (active) setApplications(data);
      })
      .catch(() => {
        if (active) setHasError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, []);

  return { applications, isLoading, hasError };
}
