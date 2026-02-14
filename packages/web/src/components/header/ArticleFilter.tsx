import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Filter, RotateCcw, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import DateBeforeAfterInput from '@/components/inputs/DateBeforeAfterInput';
import LogicalInput from '@/components/inputs/LogicalInput';
import TagInput from '@/components/inputs/TagInput';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import { useUrlParams } from '@/hooks/useUrl';
import { type ArticleFilter } from '@/types/filter';

export default function ArticleFilter() {
  const [open, setOpen] = useState(false);

  const [filter, updateUrlParams] = useUrlParams();
  const { handleSubmit, setValue, watch, reset } = useForm<ArticleFilter>({
    defaultValues: filter.articleFilter || {},
  });

  const handleDelete = () => {
    const currentValues = watch();
    const clearedValues = Object.keys(currentValues).reduce((acc, key) => {
      acc[key as keyof ArticleFilter] = undefined;
      return acc;
    }, {} as ArticleFilter);

    reset(clearedValues);
  };

  const handleReset = () => {
    reset(filter.articleFilter || {});
  };

  const onSubmit = (articleFilter: ArticleFilter) => {
    updateUrlParams(articleFilter);
    setOpen(false);
  };

  return (
    <ResponsiveModal
      trigger={
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
        </Button>
      }
      title="Advanced Filter"
      description="Set detailed filter for articles"
      buttons={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs hover:text-destructive"
          >
            <RotateCcw />
            Reset
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-xs hover:text-destructive"
          >
            <Trash />
            Clear
          </Button>
        </>
      }
      open={open}
      onOpenChange={setOpen}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <ScrollArea className="h-[60vh] px-5">
          <div className="grid gap-6 py-4">
            {/* Date fields */}
            <Label className="text-base font-bold">Dates</Label>
            <DateBeforeAfterInput
              label={'Publish Date'}
              afterValue={watch('publishedTimeAfter')}
              beforeValue={watch('publishedTimeBefore')}
              onChange={(name, d) =>
                setValue(
                  name === 'after'
                    ? 'publishedTimeAfter'
                    : 'publishedTimeBefore',
                  d
                )
              }
            />
            <DateBeforeAfterInput
              label={'Modified Date'}
              afterValue={watch('modifiedTimeAfter')}
              beforeValue={watch('modifiedTimeBefore')}
              onChange={(name, d) =>
                setValue(
                  name === 'after' ? 'modifiedTimeAfter' : 'modifiedTimeBefore',
                  d
                )
              }
            />
            <DateBeforeAfterInput
              label={'Expiration Date'}
              afterValue={watch('expirationTimeAfter')}
              beforeValue={watch('expirationTimeBefore')}
              onChange={(name, d) =>
                setValue(
                  name === 'after'
                    ? 'expirationTimeAfter'
                    : 'expirationTimeBefore',
                  d
                )
              }
            />

            <hr />

            {/* Array fields (Types, Sites, Locales, Sections) */}
            <Label className="text-base font-bold">Types and Site Names</Label>
            <TagInput
              label="Types"
              value={watch('includeTypes')}
              onChange={(val) => setValue('includeTypes', val)}
            />
            <TagInput
              label="Site Names"
              value={watch('includeSiteNames')}
              onChange={(val) => setValue('includeSiteNames', val)}
            />
            <TagInput
              label="Locales"
              value={watch('includeLocales')}
              onChange={(val) => setValue('includeLocales', val)}
            />
            <TagInput
              label="Sections"
              value={watch('includeSections')}
              onChange={(val) => setValue('includeSections', val)}
            />
            {/* Authors is a 2D array but only allowing one group for simplicity */}
            <TagInput
              label="Authors"
              value={watch('includeAuthors')?.[0] || []}
              onChange={(val) => setValue('includeAuthors', [val])}
            />

            <hr />

            {/* Tags - 2D array */}
            <Label className="text-base font-bold">Tags</Label>
            <LogicalInput
              value={watch('includeTags')}
              onChange={(val) => setValue('includeTags', val)}
            />
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-muted/50 flex justify-end gap-2">
          <Button onClick={() => setOpen(false)} className="w-full mt-4">
            Apply Changes
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
