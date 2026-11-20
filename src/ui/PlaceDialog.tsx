import type { Place } from '../content';
import { ContentBlocks, LinkList } from './ContentBlocks';
import { Dialog } from './Dialog';

export function PlaceDialog({ place, onClose }: { place: Place; onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} title={place.title} eyebrow={place.zone}>
      <ContentBlocks blocks={place.body} headingLevel={3} lead />
      <LinkList links={place.links} />
    </Dialog>
  );
}
