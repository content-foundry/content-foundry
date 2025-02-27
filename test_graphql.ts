// A simple script to test GraphQL queries

const query = `
  query {
    viewer { 
      contentCollection(slug: "blog") { 
        id 
        name 
        slug 
        items { 
          edges { 
            node { 
              id 
              title 
              body 
              slug 
            }
          }
        }
      }
    }
  }
`;

const response = await fetch("http://localhost:8002/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query }),
});

const result = await response.json();
console.log(JSON.stringify(result, null, 2));