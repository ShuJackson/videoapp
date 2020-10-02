import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listComments } from './graphql/queries';
import { createComment as createCommentMutation, deleteComment as deleteCommentMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

function App() {
  const [comments, setComments] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    const apiData = await API.graphql({ query: listComments });
    setComments(apiData.data.listComments.items);
  }

  async function createComment() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createCommentMutation, variables: { input: formData } });
    setComments([ ...comments, formData ]);
    setFormData(initialFormState);
  }

  async function deleteComment({ id }) {
    const newCommentsArray = comments.filter(comment => comment.id !== id);
    setComments(newCommentsArray);
    await API.graphql({ query: deleteCommentMutation, variables: { input: { id } }});
  }

  return (
    <div className="App">
      <h1>Baby City</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Comment name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Comment description"
        value={formData.description}
      />
      <button onClick={createComment}>Create Comment</button>
      <div style={{marginBottom: 30}}>
        {
          comments.map(comment => (
            <div key={comment.id || comment.name}>
              <h2>{comment.name}</h2>
              <p>{comment.description}</p>
              <button onClick={() => deleteComment(comment)}>Delete comment</button>
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);