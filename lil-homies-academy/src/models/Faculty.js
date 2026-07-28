export class Faculty {
  constructor(id, name, qualification, department, image = '') {
    this.id = id;
    this.name = name;
    this.qualification = qualification;
    this.department = department;
    this.image = image || `[https://api.dicebear.com/7.x/bottts/svg?seed=$](https://api.dicebear.com/7.x/bottts/svg?seed=$){name}`;
  }
}

export const facultyList = [
  new Faculty(1, 'Dr. R. Sharma', 'Ph.D. in Physics', 'Science & Research'),
  new Faculty(2, 'Prof. A. Verma', 'M.Tech in CSE', 'Computer Science'),
  new Faculty(3, 'S. K. Rao', 'M.Sc. Mathematics', 'Mathematics'),
  new Faculty(4, 'M. Kapoor', 'M.FA Cinematography', 'Media & Creative Arts')
];