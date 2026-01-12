"use client"

export const dynamic = 'force-dynamic'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { templates } from '@/config/templates'

export default function TemplatesPage() {
  return (
    <div className="w-full">
      <div className="h-16 px-4 flex items-center">
        <p className="text-sm text-muted-foreground">
          Start with a pre-built template or create your own custom flow
        </p>
      </div>

      <div className="pt-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const IconComponent = template.icon
          return (
            <Card key={template.id} className="p-6 hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="flex items-start gap-4 mb-4 flex-1">
                <div className="p-2 rounded-lg bg-muted">
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Features:</div>
                <div className="flex flex-wrap gap-2">
                  {template.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <Link href={`/app/flows/new?template=${template.id}`}>
                <Button className="w-full">
                  Use Template
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </Card>
          )
        })}
        </div>
      </div>
    </div>
  )
}
