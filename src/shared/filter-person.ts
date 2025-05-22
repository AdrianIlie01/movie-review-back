export class FilterPerson {
  name?: string;
  born?: string;
  roles?: string[];
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  ratingMin?: number;
}