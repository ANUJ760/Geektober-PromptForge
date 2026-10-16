import { describe, it, expect, vi, beforeEach } from 'vitest';
import Users from '../models/user.js';
import Prompt from '../models/prompt.js';
import { addLike, removeLike, likeList } from '../controllers/authController.js';

vi.mock('../models/user.js', () => ({
  default: { findOneAndUpdate: vi.fn(), exists: vi.fn(), updateOne: vi.fn(), findById: vi.fn() },
}));
vi.mock('../models/prompt.js', () => ({
  default: { findByIdAndUpdate: vi.fn(), findOneAndUpdate: vi.fn(), findById: vi.fn() },
}));

const USER_ID = '64b7f0c2a1b2c3d4e5f60718';
const OTHER_USER_ID = '64b7f0c2a1b2c3d4e5f60719';
const PROMPT_ID = '64b7f0c2a1b2c3d4e5f60720';

const createRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

const createReq = (body = {}, user = { id: USER_ID }) => ({ body: { promptId: PROMPT_ID, ...body }, user });

describe('Like Toggle Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addLike increments the counter once when the user newly likes a prompt', async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: USER_ID });
    Prompt.findByIdAndUpdate.mockResolvedValue({ _id: PROMPT_ID, likes: 1 });
    const res = createRes();

    await addLike(createReq(), res);

    expect(Users.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: USER_ID, likedPrompts: { $ne: PROMPT_ID } },
      { $addToSet: { likedPrompts: PROMPT_ID } },
      { new: true }
    );
    expect(Prompt.findByIdAndUpdate).toHaveBeenCalledWith(PROMPT_ID, { $inc: { likes: 1 } }, { new: true });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      isLiked: true,
      prompt: { _id: PROMPT_ID, likes: 1 },
    });
  });

  it('addLike does not touch the counter when the prompt is already liked', async () => {
    Users.findOneAndUpdate.mockResolvedValue(null);
    Users.exists.mockResolvedValue({ _id: USER_ID });
    Prompt.findById.mockResolvedValue({ _id: PROMPT_ID, likes: 5 });
    const res = createRes();

    await addLike(createReq(), res);

    expect(Prompt.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      isLiked: true,
      prompt: { _id: PROMPT_ID, likes: 5 },
    });
  });

  it('addLike rolls back the user change when the prompt does not exist', async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: USER_ID });
    Prompt.findByIdAndUpdate.mockResolvedValue(null);
    const res = createRes();

    await addLike(createReq(), res);

    expect(Users.updateOne).toHaveBeenCalledWith(
      { _id: USER_ID },
      { $pull: { likedPrompts: PROMPT_ID } }
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('removeLike decrements only while the counter is above zero', async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: USER_ID });
    Prompt.findOneAndUpdate.mockResolvedValue({ _id: PROMPT_ID, likes: 2 });
    const res = createRes();

    await removeLike(createReq(), res);

    expect(Prompt.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: PROMPT_ID, likes: { $gt: 0 } },
      { $inc: { likes: -1 } },
      { new: true }
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      isLiked: false,
      prompt: { _id: PROMPT_ID, likes: 2 },
    });
  });

  it('removeLike never drives the counter below zero', async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: USER_ID });
    Prompt.findOneAndUpdate.mockResolvedValue(null);
    Prompt.findById.mockResolvedValue({ _id: PROMPT_ID, likes: 0 });
    const res = createRes();

    await removeLike(createReq(), res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      isLiked: false,
      prompt: { _id: PROMPT_ID, likes: 0 },
    });
    expect(Users.updateOne).not.toHaveBeenCalled();
  });

  it('removeLike restores the user change when the prompt does not exist', async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: USER_ID });
    Prompt.findOneAndUpdate.mockResolvedValue(null);
    Prompt.findById.mockResolvedValue(null);
    const res = createRes();

    await removeLike(createReq(), res);

    expect(Users.updateOne).toHaveBeenCalledWith(
      { _id: USER_ID },
      { $addToSet: { likedPrompts: PROMPT_ID } }
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('ignores a client-supplied userId and acts on the authenticated user only', async () => {
    Users.findOneAndUpdate.mockResolvedValue({ _id: USER_ID });
    Prompt.findByIdAndUpdate.mockResolvedValue({ _id: PROMPT_ID, likes: 1 });

    await addLike(createReq({ userId: OTHER_USER_ID }), createRes());

    expect(Users.findOneAndUpdate.mock.calls[0][0]._id).toBe(USER_ID);
  });

  it('rejects like requests without an authenticated user, even with a userId in the body', async () => {
    const res = createRes();

    await addLike(createReq({ userId: OTHER_USER_ID }, null), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(Users.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('removeLike ignores a client-supplied userId when unauthenticated', async () => {
    const res = createRes();

    await removeLike(createReq({ userId: OTHER_USER_ID }, null), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(Users.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('likeList returns an empty list without an authenticated user', async () => {
    const res = createRes();

    await likeList(createReq({ userId: OTHER_USER_ID }, null), res);

    expect(res.json).toHaveBeenCalledWith({ likedPrompts: [] });
    expect(Users.findById).not.toHaveBeenCalled();
  });

  it('rejects a malformed prompt ID with 400 before touching the database', async () => {
    const res = createRes();

    await addLike(createReq({ promptId: 'not-an-id' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Users.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
