import type { SavedItem } from "./storage/schema";

export type ActivityGroup = { activityId: string; activity: string; items: SavedItem[] };
export type RoomGroup = {
  roomId: string;
  room: string;
  count: number;
  activities: ActivityGroup[];
};

/**
 * Groups saved items by room, then by activity. Pure and in-memory only.
 * Order follows the input (newest first from the repository): the room or
 * activity holding the most recent item comes first.
 */
export function groupSavedItems(items: SavedItem[]): RoomGroup[] {
  const rooms = new Map<string, RoomGroup>();
  for (const item of items) {
    let room = rooms.get(item.roomId);
    if (!room) {
      room = { roomId: item.roomId, room: item.room, count: 0, activities: [] };
      rooms.set(item.roomId, room);
    }
    let activity = room.activities.find((a) => a.activityId === item.activityId);
    if (!activity) {
      activity = { activityId: item.activityId, activity: item.activity, items: [] };
      room.activities.push(activity);
    }
    activity.items.push(item);
    room.count += 1;
  }
  return [...rooms.values()];
}
