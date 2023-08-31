import { cache } from 'react';

const getNotes = cache(
  async (current: number, size: number, search?: string) => {
    const res = await fetch(
      `http://localhost:3000/note?current=${current}&size=${size}${
        search && '&search=' + search
      }`
    );
    const data = await res.json();
    return data;
  }
);

export { getNotes };
