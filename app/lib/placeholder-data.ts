const templates = [
  { id: 1, title: "T-Shirt Basic", author: "PolaTech" },
  { id: 2, title: "Kemeja Slim Fit", author: "Rina K." },
  { id: 3, title: "Dress A-Line", author: "PolaTech" },
  { id: 4, title: "Jaket Bomber", author: "Sam D." },
  { id: 5, title: "Celana Chino", author: "PolaTech" },
  { id: 6, title: "Rok Flare", author: "Dina M." },
];

const projects = [
    { id: 1, title: "Kemeja Formal Pria", date: "21-03-2025" },
    { id: 2, title: "Gaun Pesta Wanita", date: "18-03-2025" },
    { id: 3, title: "Blazer Casual", date: "15-03-2025" },
];

const DUMMY_USERS = [
  {
    id: "1",
    name: "Admin PolaTech",
    email: "admin@polatech.com",
    password: "password123", // Dalam realita, ini harus di-hash
    avatar: "https://ui-avatars.com/api/?name=Admin+PolaTech",
  },
  {
    id: "2",
    name: "Desainer User",
    email: "user@example.com",
    password: "user789",
    avatar: "https://ui-avatars.com/api/?name=Desainer+User",
  }
];

export { templates, projects, DUMMY_USERS }